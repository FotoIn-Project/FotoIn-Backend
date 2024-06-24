import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { CustomerInformation } from './customer-information.entity';
import { Catalog } from 'src/catalog/entities/catalog.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn({type : 'bigint'})
  id: number;

  @Column({type : 'bigint'})
  catalogId: number;

  @Column({type : 'bigint'})
  userBookingId: number;

  @Column({type : 'bigint'})
  ownerId: number;

  @Column()
  status: string;

  @ManyToOne(() => CustomerInformation, { cascade: true })
  @JoinColumn({ name: 'customerInformationId' })
  customerInformation: CustomerInformation;

  @ManyToOne(() => Catalog, catalog => catalog.bookings)
  @JoinColumn({ name: 'catalogId' })
  catalog: Catalog;


  @BeforeInsert()
  generateProfileId() {
      this.id = new Date().valueOf();
  }

}
