import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tag } from 'generated/prisma';
import { mapToDto } from 'src/common/utils/transform.utils';
import { TagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTagDto: CreateTagDto) {
    const newTag = await this.prisma.tag.create({
      data: {
        ...createTagDto,
        userId,
      },
    });

    return this.toDto(newTag);
  }

  async findAll(userId: string) {
    const tags = await this.prisma.tag.findMany({
      where: {
        userId,
      },
    });

    const data = tags.map((tag) => this.toDto(tag));
    return data;
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });

    if (!tag) throw new NotFoundException(`Tag with id ${id} not found`);

    return this.toDto(tag);
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.prisma.tag.update({
      where: {
        id,
      },
      data: {
        ...updateTagDto,
      },
    });

    return this.toDto(tag);
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
  }

  private toDto(tag: Tag) {
    return mapToDto(TagDto, tag, { excludeExtraneousValues: true });
  }
}
