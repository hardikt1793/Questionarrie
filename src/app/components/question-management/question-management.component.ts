import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-question-management',
  templateUrl: './question-management.component.html',
  styleUrls: ['./question-management.component.scss'],
})
export class QuestionManagementComponent implements OnInit {
  questionsList: any = [];

  questionId: string = '';

  showDeleteModal: boolean = false;

  ngOnInit(): void {
    this.questionsList = JSON.parse(localStorage.getItem('questions')!)?.sort(
      (a: any, b: any) => {
        const dateA: Date = new Date(a.createdAt),
          dateB: Date = new Date(b.createdAt);

        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return 0;
      }
    );
  }

  // Function to close modal when the user clicks anywhere outside of it
  @HostListener('click', ['$event'])
  function(event: any) {
    const element: any = document.getElementById('deleteQuestionModal');

    if (event.target == element) {
      this.showDeleteModal = false;
    }
  }

  // Open confirmation dialog for deleting the question
  deleteConfirmation(id: string) {
    this.questionId = id;
    this.showDeleteModal = true;
  }

  // Delete the question
  deleteQuestion() {
    this.questionsList = this.questionsList.filter(
      (element: any) => element.createdAt !== this.questionId
    );

    localStorage.setItem('questions', JSON.stringify(this.questionsList));

    this.showDeleteModal = false;
  }
}
