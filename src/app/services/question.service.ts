import { Injectable } from "@angular/core";
import { Question } from "../models/question.model";

@Injectable({
  providedIn: "root",
})
export class QuestionService {
  // questions localstorage key
  private storageKey = "questions";

  /**
   * Setter to update the local storage.
   */
  set setLocalStorage(questions: Question[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(questions));
  }
  /**
   * Get the question lists.
   * @returns questions
   */
  get getQuestionsList(): Question[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || "[]");
  }

  /**
   * Get the question by id.
   * @param questionId - question id
   * @returns question details
   */
  getQuestionById(questionId: string): Question | null {
    const questionsList = this.getQuestionsList;
    const questionDetails = questionsList.find(
      (element: Question) => element.createdAt === questionId
    );
    return questionDetails ?? null;
  }

  /**
   * Create new question.
   * @param questionPayload - the payload to be created question for.
   */
  addNewQuestion(questionPayload: Question): void {
    let questionsList = this.getQuestionsList;
    questionsList = [
      {
        ...questionPayload,
        id:
          questionsList.length === 0
            ? "1"
            : (
                Math.max(
                  ...questionsList.map((element: Question) => +element.id * 1)
                ) + 1
              ).toString(),
      },
    ].concat(questionsList);

    this.setLocalStorage = questionsList;
  }

  /**
   * Update question by id.
   * @param questionPayload - the payload to be created question for.
   */
  updateQuestion(questionId: string, questionPayload: Question): void {
    let questionsList = this.getQuestionsList;
    const questionIndex = questionsList.findIndex(
      (element: Question) => element.createdAt === questionId
    );
    if (questionIndex !== -1) {
      questionsList[questionIndex] = questionPayload;
      this.setLocalStorage = questionsList;
    }
  }

  /**
   * To delete the question by id.
   * @param id - the question id to be deleted.
   */
  deleteQuestionById(questionId: string): void {
    const questionsList = this.getQuestionsList;
    const updatedQuestionList = questionsList.filter(
      (element: Question) => element.createdAt !== questionId
    );
    this.setLocalStorage = updatedQuestionList;
  }
}
