import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksRepository {
  constructor(@InjectRepository(Task) private tasksRepository: Repository<Task>) { }


  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;

    const query = this.tasksRepository.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: user.id })

    if (status) {
      query.andWhere('task.status= :status', { status })
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` }
      )
    }

    const tasks = query.getMany();
    return tasks;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const foundTask = await this.tasksRepository.findOne({ where: { id, userId: user.id } })
    if (!foundTask) {
      throw new NotFoundException(`Task with ID: '${id}' was not found`)
    }

    return foundTask;
  }


  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.DONE,
      user
    })

    await this.tasksRepository.save(task)

    return task;
  }

  async updateTaskStatus(updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const { id, status } = updateTaskDto;
    let task = await this.getTaskById(id, user);
    task.status = status['status'];
    await this.tasksRepository.save(task)
    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id, userId: user.id })
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID: '${id}' was not found`)
    }
  }
}
