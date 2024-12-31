import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Question } from "src/app/models/question.model";
import { QuestionService } from "src/app/services/question.service";

@Component({
  selector: "app-add-question",
  templateUrl: "./add-question.component.html",
  styleUrls: ["./add-question.component.scss"],
})
export class AddQuestionComponent implements OnInit {
  //question form group
  questionForm: FormGroup = new FormGroup({
    id: new FormControl(""),
    question: new FormControl("", Validators.required),
    questionType: new FormControl("", Validators.required),
    options: new FormArray([]),
    createdAt: new FormControl(""),
    answer: new FormControl(),
  });

  // question id to identify edit mode and populate details
  questionId: string = "";

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.questionId = this.activatedRoute.snapshot.params["id"];

    if (!!this.questionId) {
      this.getQuestionDetails();
    }
  }

  /**
   * Function for getting question details for editing question.
   */
  getQuestionDetails(): void {
    const questionDetails = this.questionService.getQuestionById(
      this.questionId
    );
    if (questionDetails) {
      questionDetails.options.map(() => {
        this.addNewOption();
      });

      this.questionForm.patchValue(questionDetails);
    }
  }

  // Getter function for options formArray
  get options(): FormArray {
    return this.questionForm.controls["options"] as FormArray;
  }

  /**
   * Function for adding new option records to form array.
   */
  addNewOption(): void {
    this.options.push(
      this._fb.group({
        option: new FormControl("", Validators.required),
      })
    );
  }

  /**
   * Function for deleting options records from form array.
   * @param index - index to be removed.
   */
  deleteOption(index: number): void {
    this.options.removeAt(index);
  }

  /**
   * Function for checking validation of options form array values.
   * @param index - index of the option to be validated
   * @returns boolean
   */
  getOptionValidation(index: number): boolean {
    const control = (<FormArray>this.questionForm.get("options")).controls[
      index
    ].get("option");
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  /**
   * Function for checking validation of form controls.
   * @param controlName - control to be validated
   * @returns boolean
   */
  checkFormControlValidation(controlName: string): boolean {
    const control = this.questionForm.get(controlName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  /**
   * On question type change event.
   */
  onQuestionTypeChange(): void {
    if (this.options.length === 0) {
      if (this.questionForm.value.questionType !== "open") {
        this.addNewOption();
        this.addNewOption();
      }
    } else if (this.questionForm.value.questionType === "open") {
      while (this.options.length) {
        this.deleteOption(0);
      }
    }
  }

  /**
   * Function for creating or updating question form.
   * @returns
   */
  submitQuestionForm(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    if (!this.questionForm.value.createdAt) {
      this.questionForm.patchValue({
        createdAt: new Date(),
      });
    }

    if (!!this.questionId) {
      this.questionService.updateQuestion(
        this.questionId,
        this.questionForm.value
      );
    } else {
      this.questionService.addNewQuestion(this.questionForm.value);
    }
    this.router.navigate(["question-management"]);
  }
}
