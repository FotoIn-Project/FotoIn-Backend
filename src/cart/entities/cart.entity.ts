import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Catalog } from 'src/catalog/entities/catalog.entity';
import { CartItemType } from '../dto/create-cart.dto';
@Entity()
export class CartItem {
    @PrimaryGeneratedColumn({type : 'bigint'})
    id: number;

    @ManyToOne(() => User, user => user.cartItems)
    user: User;

    @ManyToOne(() => Catalog, catalog => catalog.cartItems)
    catalog: Catalog;

    @Column({
        type: 'enum',
        enum: CartItemType,
    })
    type: CartItemType;

    @Column({ default: true })
    statusData: boolean;

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
