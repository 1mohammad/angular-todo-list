import { Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TaskItemComponent } from '@components/task-item/task-item.component';
import { ListModel } from '@models/list.model';
import { TaskModel } from '@models/task.model';
import { ListHttpService } from '@services/list-http.service';
import { ListService } from '@services/list.service';
import { TaskHttpService } from '@services/task-http.service';
import { TaskService } from '@services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
	MatButtonModule,
	MatIconModule,
	TaskItemComponent,
	MatMenuModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
	private readonly taskHttpService = inject(TaskHttpService);
	private readonly listHttpService = inject(ListHttpService);
	private readonly listService = inject(ListService);
	private readonly taskService = inject(TaskService);
	private readonly router = inject(Router);

	@Input({required: true}) data: ListModel | undefined;

	listData?: ListModel;
	tasksList = signal<TaskModel[]>([])

	ngOnChanges(changes: SimpleChanges): void {
		if (!changes['data'] || !changes['data'].currentValue || changes['data'].previousValue?._id === changes['data'].currentValue._id) {
		  return;
		}
	  
		const newData = changes['data'].currentValue;
		this.listData = newData;
		const newId = newData?._id;
	  
		if (newId) {
		  this.taskHttpService.getTasksById(newId).subscribe({
			next: (res) => {
			  this.tasksList.set(res);
			}
		  });
		}
	  }

	deleteList():void {
		if(!this.listData) return;
		this.listHttpService.deleteList(this.listData?._id).subscribe({
			next: () => {
				this.router.navigate(['/']);
			}
		})
	}

	editList():void {
		if (!this.listData) return;
		this.listService.openAddEditDialog(this.listData).subscribe({
			next: (result) => {
				this.listData = result;
			}
		})
	}

	newTask():void {
		if (!this.listData) return;
		this.taskService.openAddEditDialog(this.listData._id).subscribe({
			next: (res) => {
				if(!res) return;
				this.tasksList.update(list => ([...list, res]))
			}
		})
	}

	deleteTask(task: TaskModel):void {
		this.tasksList.update(data => data.filter(item => item._id !== task._id));
	}
	
}
