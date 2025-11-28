import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserWithoutPass } from 'src/common/types/user.type';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(
    @CurrentUser() user: UserWithoutPass,
    @Body() createTagDto: CreateTagDto,
  ) {
    return this.tagsService.create(user.id, createTagDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserWithoutPass) {
    return this.tagsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
