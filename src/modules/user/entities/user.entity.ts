import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Base } from '@shared/entities/base.entity';

@Entity({ name: 'users' })
export class User extends Base {
  @Exclude()
  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;
}
