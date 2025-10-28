import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import ParentChild from '../../database/entities/parent-child.entity';
import { ParentChildService } from './parent-child.service';
import { CreateParentChildDto } from './dto/create-parent-child.dto';
import { UpdateParentChildDto } from './dto/update-parent-child.dto';

@ApiTags('Parent-Child')
@Controller('parent-children')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParentChildController {
  constructor(private readonly parentChildService: ParentChildService) {}

  @Post()
  @ApiBody({ type: CreateParentChildDto })
  @ApiResponse({
    status: 200,
    description: 'Parent-child relationship created successfully',
    type: ApiResponseModel,
  })
  async createParentChild(
    @Body() createParentChildDto: CreateParentChildDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ParentChild>> {
    const parentChild = await this.parentChildService.createParentChild(
      createParentChildDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      parentChild,
      'Parent-child relationship created successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Parent-child relationships retrieved successfully',
    type: ApiResponseModel,
  })
  async getParentChildren(): Promise<ApiResponseModel<ParentChild[]>> {
    const parentChildren = await this.parentChildService.getParentChildren();
    return ApiResponseModel.success(
      parentChildren,
      'Parent-child relationships retrieved successfully',
    );
  }

  @Get('my-children')
  @ApiResponse({
    status: 200,
    description: 'User children retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyChildren(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ParentChild[]>> {
    const children = await this.parentChildService.getUserChildren(req.user.id);
    return ApiResponseModel.success(
      children,
      'User children retrieved successfully',
    );
  }

  @Get('my-parents')
  @ApiResponse({
    status: 200,
    description: 'User parents retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyParents(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ParentChild[]>> {
    const parents = await this.parentChildService.getUserParents(req.user.id);
    return ApiResponseModel.success(
      parents,
      'User parents retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Parent-child relationship retrieved successfully',
    type: ApiResponseModel,
  })
  async getParentChildById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<ParentChild>> {
    const parentChild = await this.parentChildService.getParentChildById(id);
    return ApiResponseModel.success(
      parentChild,
      'Parent-child relationship retrieved successfully',
    );
  }

  @Put(':id')
  @ApiBody({ type: UpdateParentChildDto })
  @ApiResponse({
    status: 200,
    description: 'Parent-child relationship updated successfully',
    type: ApiResponseModel,
  })
  async updateParentChild(
    @Param('id') id: string,
    @Body() updateParentChildDto: UpdateParentChildDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<ParentChild>> {
    const parentChild = await this.parentChildService.updateParentChild(
      id,
      updateParentChildDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      parentChild,
      'Parent-child relationship updated successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Parent-child relationship deleted successfully',
    type: ApiResponseModel,
  })
  async deleteParentChild(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.parentChildService.deleteParentChild(id, req.user.id);
    return ApiResponseModel.success(
      undefined,
      'Parent-child relationship deleted successfully',
    );
  }

  @Get('child/:childId/performance')
  @ApiResponse({
    status: 200,
    description: 'Child performance retrieved successfully',
    type: ApiResponseModel,
  })
  async getChildPerformance(
    @Param('childId') childId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any[]>> {
    const performance = await this.parentChildService.getChildPerformance(
      childId,
      req.user.id,
    );
    return ApiResponseModel.success(
      performance,
      'Child performance retrieved successfully',
    );
  }
}
