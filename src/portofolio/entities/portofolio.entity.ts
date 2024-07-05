import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { PortofolioGallery } from './portofolio-gallery.entity';

@Entity()
export class Portofolio {
  @PrimaryGeneratedColumn({type : 'bigint'})
  id: number;

  @Column()
  title: string;

  @Column()
  tags: string;

  @Column({type : 'bigint'})
  ownerId: number;

  @OneToMany(() => PortofolioGallery, gallery => gallery.portfolio, { cascade: true })
  gallery: PortofolioGallery[];

  @BeforeInsert()
  generateProfileId() {
    this.id = new Date().valueOf();
  }
}

