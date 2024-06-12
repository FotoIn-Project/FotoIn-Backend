import { DataSource } from 'typeorm';
import { Category } from 'src/catalog/entities/category.entity';

const categories = [
    { name: 'Wedding', description: 'Wedding photography' },
    { name: 'Pre-wedding', description: 'Pre-wedding photography' },
    { name: 'Birthday', description: 'Birthday photography' },
    { name: 'Graduation', description: 'Graduation photography' },
    { name: 'Holiday moments', description: 'Holiday moments photography' },
    { name: 'New born', description: 'New born photography' },
    { name: 'Engagement', description: 'Engagement photography' },
    { name: 'Gender reveal', description: 'Gender reveal photography' },
    { name: 'UMKM Photo', description: 'UMKM photography' },
    { name: 'Family FotoIn', description: 'Family photography' },
    { name: 'Lanskap fotografi', description: 'Landscape photography' },
    { name: 'Commercial Advertising photo', description: 'Commercial Advertising photography' },
    { name: 'Group photo', description: 'Group photography' },
    { name: 'Lain-lain', description: 'Miscellaneous photography' }
];

export class CategorySeeder {
    public async run(dataSource: DataSource): Promise<void> {
        const categoryRepository = dataSource.getRepository(Category);
        for (const categoryData of categories) {
            const category = categoryRepository.create(categoryData);
            await categoryRepository.save(category);
        }
    }
}
