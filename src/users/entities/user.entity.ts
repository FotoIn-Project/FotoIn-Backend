import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, OneToOne, OneToMany } from "typeorm";
import { ProfileUser } from "src/profile-user/entities/profile-user.entity";
import { Transaction } from "src/transactions/entities/transactions.entity";
import { CartItem } from "src/cart/entities/cart.entity";
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

    @Column()
    verified_code: number;

    @Column({nullable : true})
    reset_password_token : number;

    @OneToOne(() => ProfileUser, profile => profile.user)
    profile: ProfileUser;

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions: Transaction[];

    @OneToMany(() => CartItem, cartItem => cartItem.user)
    cartItems: CartItem[];

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
        this.verified_code = this.generateVerificationCode();
    }

    private generateVerificationCode(): number {
        return Math.floor(1000 + Math.random() * 9000);
    }
}
