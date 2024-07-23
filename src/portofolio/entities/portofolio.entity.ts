import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, ManyToOne } from 'typeorm';
import { PortofolioGallery } from './portofolio-gallery.entity';
import { Category } from 'src/catalog/entities/category.entity';
import {Catalog} from 'src/catalog/entities/catalog.entity';

@Entity()
export class Portofolio {
  @PrimaryGeneratedColumn({type : 'bigint'})
  id: number;

  @Column()
  title: string;

  @Column({type : 'bigint'})
  ownerId: number;

  @OneToMany(() => PortofolioGallery, gallery => gallery.portfolio, { cascade: true })
  gallery: PortofolioGallery[];

  @ManyToOne(() => Category, category => category.catalogs, {cascade: true})
  category: Category;

  @OneToMany(() => Catalog, catalog => catalog.portofolio)
  catalogs: Catalog[];

  @BeforeInsert()
  generateProfileId() {
    this.id = new Date().valueOf();
  }
}

