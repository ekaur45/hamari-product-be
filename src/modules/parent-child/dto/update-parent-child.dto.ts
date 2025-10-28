import { PartialType } from '@nestjs/swagger';
import { CreateParentChildDto } from './create-parent-child.dto';

export class UpdateParentChildDto extends PartialType(CreateParentChildDto) {}
