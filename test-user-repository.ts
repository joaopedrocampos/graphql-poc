import dotenv from 'dotenv';
import { UserRepositoryPostgres } from './src/modules/user/infra/user.repository'
import { UserService } from './src/modules/user/application/user.service'

dotenv.config();

async function test() {
    try {
        const repository = new UserRepositoryPostgres();
        const service = new UserService(repository);

        // const user = await service.create({
        //     name: 'Joao Pedro',
        //     email: 'joao@test.com',
        // });

        // console.log('Usuario criado:', user);

        const foundUser = await service.findById('ff8a7828-376a-4ec2-9ba1-e58ffb64183a');
        console.log('Usuario encontrado:', foundUser);

        const userByEmail = await service.findByEmail('joao@test.com');
        console.log('Usuario por e-mail encontrado:', userByEmail);
    } catch (error) {
       console.error('Erro:', error); 
    } finally {
        process.exit(0);
    }
}

test();