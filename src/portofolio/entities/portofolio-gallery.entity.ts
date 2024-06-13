import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Portofolio } from './portofolio.entity';

@Entity()
export class PortofolioGallery {
  @PrimaryGeneratedColumn({type : 'bigint'})
  id: number;

  @Column()
  path: string;

  @ManyToOne(() => Portofolio, portfolio => portfolio.gallery)
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portofolio;

  @Column()
  portfolioId: number;

  @BeforeInsert()
    generateProfileId() {
        this.id = new Date().valueOf();
    }
}
