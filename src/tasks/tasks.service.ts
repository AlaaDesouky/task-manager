import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid'
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = []

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTasksWithFilter(filterDto: GetTasksFilterDto): Task[] {
    const { search, status } = filterDto;
    let tasks: Task[] = this.getAllTasks();

    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(task => task.title.includes(search) || task.description.includes(search) ? true : false)
    }

    return tasks;
  }

  getTaskById(id: string): Task {
    const foundTask = this.tasks.find(task => task.id === id)
    if (!foundTask) {
      throw new NotFoundException(`Task with ID: '${id}' was not found`)
    }

    return foundTask;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN
    }

    this.tasks.push(task)

    return task;
  }

  updateTaskStatus(updateTaskDto: UpdateTaskDto): Task {
    const { id, status } = updateTaskDto;
    let task = this.getTaskById(id);
    task.status = status['status'];

    return task;
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId)
  }
}
