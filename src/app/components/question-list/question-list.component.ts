import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Question } from "src/app/models/question.model";

@Component({
  selector: "app-question-list",
  templateUrl: "./question-list.component.html",
  styleUrls: ["./question-list.component.scss"],
})
export class QuestionListComponent implements OnInit {
  // answer form group
  answersForm: FormGroup = new FormGroup({});

  // list of all questions
  questionList: Question[] = [];

  // list of answered questions
  answeredQuestionList: Question[] = [];

  // list of unanswered questions
  unansweredQuestionList: Question[] = [];

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.getQuestionList();
  }

  /**
   * Get list of questions & divide it in answered & unanswered question list.
   */
  getQuestionList(): void {
    this.questionList = JSON.parse(localStorage.getItem("questions")!);

    this.questionList?.map((element: Question) => {
      if (
        !element.answer ||
        (element.questionType === "multiple" &&
          Object.keys(element.answer).length === 0)
      ) {
        this.unansweredQuestionList.push(element);

        this.unansweredQuestionList.map((element: Question) => {
          element.answer = element.questionType === "multiple" ? {} : "";

          this.answersForm.addControl(
            element.id,
            this._fb.control(element.questionType === "multiple" ? {} : "", [
              Validators.required,
            ])
          );
        });
      } else {
        this.answeredQuestionList.push(element);
        this.answeredQuestionList.sort((a: Question, b: Question) => {
          const dateA: Date = new Date(a.answeredAt!),
            dateB: Date = new Date(b.answeredAt!);

          if (dateA < dateB) return 1;
          if (dateA > dateB) return -1;
          return 0;
        });
      }
    });
  }

  /**
   * Check validation of form controls.
   * @param control - control to be validated
   * @returns boolean
   */
  checkFormControlValidation(control: string): boolean {
    const toValidateControl = this.answersForm.get(control);
    return (
      toValidateControl?.errors?.["required"] &&
      (toValidateControl?.touched || toValidateControl?.dirty)
    );
  }

  /**
   * Update value of checkbox form control.
   * @param control - control value to be updated
   * @param key - key to get the value
   */
  onCheckBoxChange(control: string, key: string): void {
    var controlValue =
      this.answersForm.get(control)?.value === undefined
        ? {}
        : this.answersForm.get(control)?.value;

    controlValue[key] = this.answersForm.get(control)?.value[key]
      ? false
      : true;

    this.answersForm.patchValue({
      [control]: controlValue,
    });
  }

  /**
   * Check the validation status of checkbox form control.
   * @param control - control to be validated.
   * @returns
   */
  isMCQValid(control: string): boolean {
    const toValidateControl = this.answersForm.get(control);
    return !!(
      toValidateControl &&
      Object.keys(toValidateControl?.value).length > 0 &&
      Object.values(toValidateControl?.value).every((v) => !v)
    );
  }

  /**
   * Submit the answer form.
   * @param questionDetails - question details for which answer is provided
   * @param control - answer control to get the value
   */
  submitAnswer(questionDetails: Question, control: string): void {
    this.answersForm.get(control)?.markAsTouched();

    if (
      questionDetails.questionType === "multiple" &&
      Object.keys(this.answersForm.get(control)?.value).length === 0
    ) {
      let checkboxValue: any = {};

      questionDetails.options.map((element: { option: string }) => {
        checkboxValue[element.option] = false;

        this.answersForm.patchValue({
          [control]: checkboxValue,
        });
      });
    }

    if (
      questionDetails.questionType === "multiple"
        ? !this.isMCQValid(control)
        : questionDetails.questionType === "open"
        ? this.answersForm.get(control)?.value.length < 255 &&
          this.answersForm.get(control)?.valid
        : this.answersForm.get(control)?.valid
    ) {
      questionDetails.answer = this.answersForm.get(control)?.value;
      questionDetails.answeredAt = new Date().toISOString();

      this.answersForm.removeControl(control);

      this.unansweredQuestionList = this.unansweredQuestionList.filter(
        (element: Question) => element.createdAt !== questionDetails.createdAt
      );

      this.answeredQuestionList = [questionDetails].concat(
        this.answeredQuestionList
      );

      this.questionList = JSON.parse(localStorage.getItem("questions")!);
      this.questionList[
        this.questionList.findIndex(
          (element: Question) => element.createdAt === questionDetails.createdAt
        )
      ] = questionDetails;

      localStorage.setItem("questions", JSON.stringify(this.questionList));
    }
  }

  /**
   * Clear the answer & move it to unanswered question list.
   * @param questionDetails - question details.
   */
  clearAnswer(questionDetails: Question) {
    questionDetails.answer = null;
    questionDetails.answeredAt = new Date().toISOString();

    this.answeredQuestionList = this.answeredQuestionList.filter(
      (element: Question) => element.createdAt !== questionDetails.createdAt
    );

    this.answersForm.addControl(
      questionDetails.id,
      this._fb.control(questionDetails.questionType === "multiple" ? {} : "", [
        Validators.required,
      ])
    );

    this.unansweredQuestionList = [questionDetails].concat(
      this.unansweredQuestionList
    );

    this.questionList = [
      ...this.unansweredQuestionList,
      ...this.answeredQuestionList,
    ];

    localStorage.setItem("questions", JSON.stringify(this.questionList));
  }

  castAsKeyValue(questionDetails: Question["answer"]) {
    return questionDetails as { [key: string]: boolean };
  }
}
