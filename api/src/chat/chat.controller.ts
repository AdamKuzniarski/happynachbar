import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChatService } from './chat.service';
import { ConversationDto } from './dto/conversation.dto';
import {
  ChatMessagesQueryDto,
  ListMessagesResponseDto,
} from './dto/chat-messages.dto';
import { ListConversationsResponseDto } from './dto/chat-conversations.dto';
import { UnreadCountDto } from './dto/chat-unread.dto';

@ApiTags('chat')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chat: ChatService) {}

  @Post('conversations/by-activity/:id')
  @ApiOkResponse({ type: ConversationDto })
  createOrGetByActivity(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chat.createOrGetByActivity(req.user.userId, id);
  }

  @Get('conversations')
  @ApiOkResponse({ type: ListConversationsResponseDto })
  listConversations(@Req() req: any) {
    return this.chat.listConversations(req.user.userId);
  }

  @Post('conversations/:id/read')
  markRead(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.chat.markRead(req.user.userId, id);
  }

  @Get('unread-count')
  @ApiOkResponse({ type: UnreadCountDto })
  getUnreadCount(@Req() req: any) {
    return this.chat.getUnreadCount(req.user.userId);
  }

  @Get('conversations/:id/messages')
  @ApiOkResponse({ type: ListMessagesResponseDto })
  listMessages(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() q: ChatMessagesQueryDto,
  ) {
    return this.chat.listMessages(req.user.userId, id, q);
  }
}
