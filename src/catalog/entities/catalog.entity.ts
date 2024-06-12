import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, ManyToOne } from 'typeorm';
import { CatalogGallery } from './catalog-gallery.entity';
import { Category } from './category.entity';

@Entity()
export class Catalog {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    title: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    description: string;

    @Column('simple-array')
    tags: string[];

    @Column('date')
    availableDate: Date;

    @Column()
    location: string;

    @Column({ type: 'bigint' })
    ownerId: number;

    @OneToMany(() => CatalogGallery, gallery => gallery.catalog, { cascade: true })
    gallery: CatalogGallery[];

    @ManyToOne(() => Category, category => category.catalogs)
    category: Category;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ default: 'SYSTEM' })
    created_by: string;

    @Column({ default: 'SYSTEM' })
    updated_by: string;

    @BeforeInsert()
    generateProfileId() {
        this.id = new Date().valueOf();
    }
}
