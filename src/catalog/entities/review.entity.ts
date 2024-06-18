import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { Catalog } from './catalog.entity';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';

@Entity()
export class Review {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column('int')
    rating: number;

    @Column()
    text: string;

    @Column({ nullable: true })
    photo: string;

    @ManyToOne(() => Catalog, catalog => catalog.reviews)
    catalog: Catalog;

    @ManyToOne(() => ProfileUser, profileUser => profileUser.reviews)
    reviewer: ProfileUser;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @BeforeInsert()
    generateProfileId() {
        this.id = new Date().valueOf();
    }
}
