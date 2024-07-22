import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Catalog } from './catalog.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';

@Entity()
export class Category {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => Catalog, catalog => catalog.category)
    catalogs: Catalog[];

    @OneToMany(() => Portofolio, portofolio => portofolio.category)
    portofolios: Portofolio[];

}
