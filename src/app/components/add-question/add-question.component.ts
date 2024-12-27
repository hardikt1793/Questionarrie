import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss'],
})
export class AddQuestionComponent implements OnInit {
  questionForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    question: new FormControl('', Validators.required),
    questionType: new FormControl('', Validators.required),
    options: new FormArray([]),
    createdAt: new FormControl(''),
    answer: new FormControl(),
  });

  questionId: string = '';

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.questionId = this.activatedRoute.snapshot.params['id'];

    if (!!this.questionId) {
      this.getQuestionDetails();
    }
  }

  // Function for getting question details for editing question
  getQuestionDetails() {
    const questionDetails = JSON.parse(localStorage.getItem('questions')!).find(
      (element: any) => element.createdAt === this.questionId
    );

    questionDetails.options.map(() => {
      this.addNewOption();
    });

    this.questionForm.patchValue(questionDetails);
  }

  // Getter function for options formArray
  get options() {
    return this.questionForm.controls['options'] as FormArray;
  }

  // Function for adding new  records to form array
  addNewOption() {
    this.options.push(
      this._fb.group({
        option: new FormControl('', Validators.required),
      })
    );
  }

  // Function for deleting records from form array
  deleteOption(index: number) {
    this.options.removeAt(index);
  }

  // Function for checking validation of form array values
  getOptionValidation(index: number) {
    return (
      (<FormArray>this.questionForm.get('options')).controls[index].get(
        'option'
      )?.invalid &&
      ((<FormArray>this.questionForm.get('options')).controls[index].get(
        'option'
      )?.touched ||
        (<FormArray>this.questionForm.get('options')).controls[index].get(
          'option'
        )?.dirty)
    );
  }

  // Function for checking validation of form controls
  checkFormControlValidation(controlName: string) {
    return (
      this.questionForm.get(controlName)?.invalid &&
      (this.questionForm.get(controlName)?.touched ||
        this.questionForm.get(controlName)?.dirty)
    );
  }

  // On question type change event
  onQuestionTypeChange() {
    if (this.options.length === 0) {
      if (this.questionForm.value.questionType !== 'open') {
        this.addNewOption();
        this.addNewOption();
      }
    } else if (this.questionForm.value.questionType === 'open') {
      while (this.options.length) {
        this.deleteOption(0);
      }
    }
  }

  // Function for creating or editing question form
  submitQuestionForm() {
    this.questionForm.markAllAsTouched();

    if (this.questionForm.valid) {
      if (!this.questionForm.value.createdAt) {
        this.questionForm.patchValue({
          createdAt: new Date(),
        });
      }

      let questionList: any =
        JSON.parse(localStorage.getItem('questions')!) || [];

      if (!!this.questionId) {
        const index = questionList.findIndex(
          (element: any) => element.createdAt === this.questionId
        );

        questionList[index] = this.questionForm.value;
      } else {
        questionList = [
          {
            ...this.questionForm.value,
            id:
              questionList.length === 0
                ? '1'
                : (
                    Math.max(
                      ...questionList.map((element: any) => element.id * 1)
                    ) + 1
                  ).toString(),
          },
        ].concat(questionList);
      }
      localStorage.setItem('questions', JSON.stringify(questionList));

      this.router.navigate(['question-management']);
    }
  }
}
