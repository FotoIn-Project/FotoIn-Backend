import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, OneToOne } from "typeorm";
import { ProfileUser } from "src/profile-user/entities/profile-user.entity";
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn({type : "bigint"})
    id: number;

    @Column({length : 255})
    email : string;

    @Column({length : 255})
    password : string;

    @Column({default : false})
    is_verified : boolean;

    @Column({nullable : true})
    reset_password_token : string;

    @OneToOne(() => ProfileUser, profile => profile.user)
    profile: ProfileUser;

    //auditor
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
