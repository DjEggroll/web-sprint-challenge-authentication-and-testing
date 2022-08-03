// Write your tests here
const request = require('supertest');
const server = require("./server");
const db = require('../data/dbConfig');

test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

afterAll(async () => {
  await db.destroy();
})

beforeEach(async () => {
  await db('users').truncate();
})

describe("Register new user endpoint", () => {
  test("responds with error when username not provided", async () => {
    const response = await request(server).post("/api/auth/register").send({
      username: "",
      password: "password"
    });
    expect(response.body).toMatchObject({ message: 'username and password required' })
  });

  test("responds with error when password not provided", async () => {
    const response = await request(server).post("/api/auth/register").send({
      username: "username",
      password: ""
    });
    expect(response.body).toMatchObject({ message: 'username and password required' })
  });
});

describe("Login endpoint tests", () => {
  test("Responds with invalid credentials when username is incorrect", async () => {
    await request(server).post("/api/auth/register").send({
      username: "Jeff",
      password: "password"
    })
    const response = await request(server).post("/api/auth/login").send({
      username: "Jef",
      password: "password"
    })
    expect(response.body).toMatchObject({ message: 'invalid credentials' })
  })

  test("Responds with invalid credentials when password is incorrect", async () => {
    await request(server).post("/api/auth/register").send({
      username: "Jeff",
      password: "password"
    })
    const response = await request(server).post("/api/auth/login").send({
      username: "Jeff",
      password: "passwor"
    })
    expect(response.body).toMatchObject({ message: 'invalid credentials' })
  })
})

describe("Get request", () => {
  test("Returns error without token", async () => {
    const response = await request(server).get("/api/jokes")
    expect(response.body).toMatchObject({ message: 'token required' })
  });

  test("Returns error with invalid token", async () => {
    await request(server).post("/api/auth/register").send({
      username: "Jeff",
      password: "password"
    })
    await request(server).post("/api/auth/login").send({
      username: "Jeff",
      password: "password"
    })
    const response = await request(server).get("/api/jokes").set({ Authorization: "aibhadjfbkj" })
    expect(response.body).toMatchObject({ message: 'token invalid' })
  });
})