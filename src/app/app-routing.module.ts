import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddQuestionComponent } from './components/add-question/add-question.component';
import { QuestionListComponent } from './components/question-list/question-list.component';
import { QuestionManagementComponent } from './components/question-management/question-management.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'question-management',
    pathMatch: 'full',
  },
  {
    path: 'add-question',
    component: AddQuestionComponent,
  },
  {
    path: 'edit-question/:id',
    component: AddQuestionComponent,
  },
  {
    path: 'question-list',
    component: QuestionListComponent,
  },
  {
    path: 'question-management',
    component: QuestionManagementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
