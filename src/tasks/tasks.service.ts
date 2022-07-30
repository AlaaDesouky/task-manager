import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private tasks: TasksRepository) { }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.tasks.getTasks(filterDto, user)
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    return this.tasks.getTaskById(id, user)
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.tasks.createTask(createTaskDto, user)
  }

  async updateTaskStatus(updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    return this.tasks.updateTaskStatus(updateTaskDto, user)
  }

  async deleteTask(id: string, user: User): Promise<void> {
    return this.tasks.deleteTask(id, user)
  }
}