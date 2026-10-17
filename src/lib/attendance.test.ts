import { calculateBunkable, calculateRequiredToRecover } from "./attendance";

describe("attendance calculations", () => {
  it("calculates required classes to recover", () => {
    const required = calculateRequiredToRecover(3, 5, 75);
    expect(required).toBe(3);
  });

  it("returns zero required when already above target", () => {
    const required = calculateRequiredToRecover(8, 10, 75);
    expect(required).toBe(0);
  });

  it("calculates bunkable classes", () => {
    const bunkable = calculateBunkable(9, 10, 75);
    expect(bunkable).toBe(2);
  });

  it("returns zero bunkable when below target", () => {
    const bunkable = calculateBunkable(2, 6, 75);
    expect(bunkable).toBe(0);
  });
});
