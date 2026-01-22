import { Controller } from '@nestjs/common';
import { RepostService } from './repost.service';

@Controller('repost')
export class RepostController {
  constructor(private readonly repostService: RepostService) {}
}
