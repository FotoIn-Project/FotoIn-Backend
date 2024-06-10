import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { Catalog } from './catalog.entity';

@Entity()
export class CatalogGallery {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    imageUrl: string;

    @ManyToOne(() => Catalog, catalog => catalog.gallery)
    catalog: Catalog;

    @BeforeInsert()
    generateProfileId() {
        this.id = new Date().valueOf();
    }
}
