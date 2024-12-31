import { Component, HostListener, OnInit } from "@angular/core";
import { Question } from "src/app/models/question.model";
import { QuestionService } from "src/app/services/question.service";

@Component({
  selector: "app-question-management",
  templateUrl: "./question-management.component.html",
  styleUrls: ["./question-management.component.scss"],
})
export class QuestionManagementComponent implements OnInit {
  // list of questions
  questionsList: Question[] = [];

  // to track the question id
  questionId: string = "";

  // flag to show/hide delete modal
  isshowDeleteModal: boolean = false;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.getQuestionsList();
  }

  private getQuestionsList(): void {
    this.questionsList = this.questionService.getQuestionsList?.sort(
      (a: Question, b: Question) => {
        const dateA: Date = new Date(a.createdAt),
          dateB: Date = new Date(b.createdAt);

        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return 0;
      }
    );
  }
  // Function to close modal when the user clicks anywhere outside of it
  @HostListener("click", ["$event"])
  function(event: any) {
    const element: any = document.getElementById("deleteQuestionModal");

    if (event.target == element) {
      this.isshowDeleteModal = false;
    }
  }

  /**
   * Open confirmation dialog for deleting the question.
   * @param id - id of the question to be deleted
   */
  deleteConfirmation(id: string): void {
    this.questionId = id;
    this.isshowDeleteModal = true;
  }

  /**
   * Delete the question.
   */
  deleteQuestion(): void {
    this.questionService.deleteQuestionById(this.questionId);
    this.getQuestionsList();
    this.isshowDeleteModal = false;
  }
}
