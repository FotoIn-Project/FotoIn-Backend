import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Store {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: number;

    @Column({type: "bigint"})
    userId: number;

    @Column()
    companyName: string;

    @Column()
    cameraPhoto: string;

    @Column()
    experience: string;

    @Column()
    cameraUsed: string;

    @Column()
    phoneNumber: string;

    @Column()
    country: string;

    @Column()
    province: string;

    @Column()
    city: string;

    @Column()
    address: string;

    beforeInsert() {
        this.id = new Date().valueOf();
    }
}