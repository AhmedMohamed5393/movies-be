// log.entity.ts
import { Base } from '@shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'logs' })
export class Log extends Base {
  @Column()
  title: string;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column()
  user_id: string;
}
