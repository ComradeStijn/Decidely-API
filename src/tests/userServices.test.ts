import { PrismaClient } from "@prisma/client"
import {createNewUser} from '../services/userServices'


const client = new PrismaClient();

beforeEach(async () => {
  await client.decision.deleteMany()
  await client.user.deleteMany()
  await client.userForm.deleteMany()
  await client.userGroup.deleteMany()
  await client.userGroupForm.deleteMany()
  await client.form.deleteMany()
  console.log('Database setup')
})

describe('User creation works', async () => {
  it('createNewUser returns user', async () => {
    const result = await createNewUser('Stijn', 'password', 2, undefined , 'user', 'test@test.com' )

    const expectation = {
      name: 'Stijn',
      email: 'test@test.com',
      role: 'user',
      proxyAmount: 2,
      userGroupId: null,
    }

    expect(result).toMatchObject(expectation)
  })
})