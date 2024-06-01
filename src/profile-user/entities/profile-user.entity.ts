import { BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";

@Entity()
export class ProfileUser {
    @PrimaryGeneratedColumn({type : 'bigint'})
    id : number;

    @Column({type : "bigint"})
    userId : number;

    @Column({length : 255})
    email : string;

    @Column({nullable : true})
    noHp : string;
    
    @OneToOne(() => User, user => user.profile)
    @JoinColumn()
    user: User;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;
}
