import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Review } from "src/catalog/entities/review.entity";

@Entity()
export class ProfileUser {
    @PrimaryGeneratedColumn({type : 'bigint'})
    id : number;

    @Column({nullable : true})
    company_name : string;

    @Column({nullable : true})
    province : string;

    @Column({nullable : true})
    city : string;

    @Column({nullable : true})
    address : string;

    @Column({nullable : true})
    phone_number : string;

    @Column({nullable : true})
    email_confirmation : string;
    
    @OneToOne(() => User, user => user.profile)
    @JoinColumn()
    user: User;

    @OneToMany(() => Review, review => review.reviewer, { cascade: true })
    reviews: Review[];

    @CreateDateColumn({ type: 'timestamp'})
    created_at: Date;

    @Column({default : "SYSTEM"})
    created_by : string;

    @UpdateDateColumn({ type: 'timestamp'})
    updated_at: Date;

    @Column({default : "SYSTEM"})
    updated_by : string;

    @BeforeInsert()
    generateProfileId() {
        this.id = new Date().valueOf();
    }
}
