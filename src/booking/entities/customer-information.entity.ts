import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity()
export class CustomerInformation {
  @PrimaryGeneratedColumn({type : "bigint"})
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  day: string;

  @Column()
  time: string;

  
  @BeforeInsert()
  generateProfileId() {
      this.id = new Date().valueOf();
  }
}
