import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private tasksRepository: Repository<Task>) { }


  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { search, status } = filterDto;

    const query = this.tasksRepository.createQueryBuilder('task');

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

  async getTaskById(id: string): Promise<Task> {
    const foundTask = await this.tasksRepository.findOne({ where: { id } })
    if (!foundTask) {
      throw new NotFoundException(`Task with ID: '${id}' was not found`)
    }

    return foundTask;
  }


  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.DONE
    })

    await this.tasksRepository.save(task)

    return task;
  }

  async updateTaskStatus(updateTaskDto: UpdateTaskDto): Promise<Task> {
    const { id, status } = updateTaskDto;
    let task = await this.getTaskById(id);
    task.status = status['status'];
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID: '${id}' was not found`)
    }
  }
}
