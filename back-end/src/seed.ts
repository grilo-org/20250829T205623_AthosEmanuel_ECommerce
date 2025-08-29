import * as bcrypt from 'bcryptjs';

import { DataSource } from 'typeorm';
import { Product } from './product/product.entity';
import { Purchase } from './purchase/purchase.entity';
import { User } from './user/user.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [User, Product, Purchase],
  synchronize: true,
});

export async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const adminExists = await userRepository.findOneBy({
    email: 'admin@example.com',
  });

  if (!adminExists) {
    const admin = userRepository.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('0+E9s=0.0dHg', 10),
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log('Usuário admin criado com sucesso!');
  } else {
    console.log('Admin já existe.');
  }

  await AppDataSource.destroy();
}

// Só executa se for rodado diretamente: `ts-node src/seed.ts`
if (require.main === module) {
  seed();
}
