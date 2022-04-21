import { app, server } from "../main";
import request from "supertest";

afterAll(() => {
    server.close();
});

//describe("Testing ");

describe("[GET] /", () => {
    test("should response welcome!", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
    });
});

describe("[GET] /blocks", () => {
    test("should response blockchain", async () => {
        const res = await request(app).get("/blocks");
        expect(res.statusCode).toBe(200);
    });
});
