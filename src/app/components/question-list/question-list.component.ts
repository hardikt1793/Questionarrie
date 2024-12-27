import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent implements OnInit {
  answersForm: FormGroup = new FormGroup({});

  questionList: any[] = [];
  answeredQuestionList: any[] = [];
  unansweredQuestionList: any[] = [];

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.getQuestionList();
  }

  // Get list of questions & divide it in answered & unanswered question list
  getQuestionList() {
    this.questionList = JSON.parse(localStorage.getItem('questions')!);

    this.questionList?.map((element: any) => {
      if (
        !element.answer ||
        (element.questionType === 'multiple' &&
          Object.keys(element.answer).length === 0)
      ) {
        this.unansweredQuestionList.push(element);

        this.unansweredQuestionList.map((element: any) => {
          element.answer = element.questionType === 'multiple' ? {} : '';

          this.answersForm.addControl(
            element.id,
            this._fb.control(element.questionType === 'multiple' ? {} : '', [
              Validators.required,
            ])
          );
        });
      } else {
        this.answeredQuestionList.push(element);
        this.answeredQuestionList.sort((a: any, b: any) => {
          const dateA: Date = new Date(a.answeredAt),
            dateB: Date = new Date(b.answeredAt);

          if (dateA < dateB) return 1;
          if (dateA > dateB) return -1;
          return 0;
        });
      }
    });
  }

  // Check validation of form controls
  checkFormControlValidation(control: string) {
    return (
      this.answersForm.get(control)?.errors?.['required'] &&
      (this.answersForm.get(control)?.touched ||
        this.answersForm.get(control)?.dirty)
    );
  }

  // Update value of checkbox form control
  onCheckBoxChange(control: string, key: string) {
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

  // Check the validation status of checkbox form control
  isMCQValid(control: string) {
    return (
      this.answersForm.get(control) &&
      Object.keys(this.answersForm.get(control)?.value).length > 0 &&
      Object.values(this.answersForm.get(control)?.value).every((v) => !v)
    );
  }

  // Submit the answer form
  submitAnswer(questionDetails: any, control: string) {
    this.answersForm.get(control)?.markAsTouched();

    if (
      questionDetails.questionType === 'multiple' &&
      Object.keys(this.answersForm.get(control)?.value).length === 0
    ) {
      let checkboxValue: any = {};

      questionDetails.options.map((element: any) => {
        checkboxValue[element.option] = false;

        this.answersForm.patchValue({
          [control]: checkboxValue,
        });
      });
    }

    if (
      questionDetails.questionType === 'multiple'
        ? !this.isMCQValid(control)
        : questionDetails.questionType === 'open'
        ? this.answersForm.get(control)?.value.length < 255 &&
          this.answersForm.get(control)?.valid
        : this.answersForm.get(control)?.valid
    ) {
      questionDetails.answer = this.answersForm.get(control)?.value;
      questionDetails.answeredAt = new Date();

      this.answersForm.removeControl(control);

      this.unansweredQuestionList = this.unansweredQuestionList.filter(
        (element: any) => element.createdAt !== questionDetails.createdAt
      );

      this.answeredQuestionList = [questionDetails].concat(
        this.answeredQuestionList
      );

      this.questionList = JSON.parse(localStorage.getItem('questions')!);
      this.questionList[
        this.questionList.findIndex(
          (element: any) => element.createdAt === questionDetails.createdAt
        )
      ] = questionDetails;

      localStorage.setItem('questions', JSON.stringify(this.questionList));
    }
  }

  // Clear the answer & move it to unanswered question list
  clearAnswer(questionDetails: any) {
    questionDetails.answer = null;
    questionDetails.answeredAt = new Date();

    this.answeredQuestionList = this.answeredQuestionList.filter(
      (element: any) => element.createdAt !== questionDetails.createdAt
    );

    this.answersForm.addControl(
      questionDetails.id,
      this._fb.control(questionDetails.questionType === 'multiple' ? {} : '', [
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

    localStorage.setItem('questions', JSON.stringify(this.questionList));
  }
}
