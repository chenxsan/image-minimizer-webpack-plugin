import path from "path";

import ImageMinimizerPlugin from "../src";

import { fixturesPath, webpack, isOptimized } from "./helpers";

describe("plugin minify option", () => {
  it('should work with "imagemin" minifier', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminMinify,
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work when minify is custom function", async () => {
    expect.assertions(5);

    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: (data, minifiOptions) => {
          const [[, input]] = Object.entries(data);

          expect(data).toBeDefined();
          expect(minifiOptions).toBeDefined();

          return {
            data: input,
          };
        },
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      false
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work if minify is array && minimizerOptions is object", async () => {
    expect.assertions(5);

    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect(input).toBeDefined();
            expect(minifiOptions).toBeDefined();

            return {
              data: input,
            };
          },
        ],
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work if minify is array && minimizerOptions is array", async () => {
    expect.assertions(5);

    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect("options2" in minifiOptions).toBe(true);

            return {
              data: input,
            };
          },
          (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect("options3" in minifiOptions).toBe(true);

            return {
              data: input,
            };
          },
        ],
        minimizerOptions: [
          {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
          {
            options2: "passed",
          },
          {
            options3: "passed",
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  // Todo enable test when "main" section in @squoosh/lib package.json will be fixed
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should work with "squooshMinify" minifier', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(353);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  // Todo enable test when "main" section in @squoosh/lib package.json will be fixed
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should work with "squooshMinify" minifier and minimizerOptions', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
        minimizerOptions: {
          targets: {
            ".jpg": "webp",
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(100);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  // Todo enable test when "main" section in @squoosh/lib package.json will be fixed
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should emit warning when file is not supported by "squooshMinify"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
        minimizerOptions: {
          targets: {
            ".jpg": false,
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(warnings[0].toString()).toMatch(
      /was not minified by "ImageMinimizerPlugin.squooshMinify"/
    );
    expect(errors).toHaveLength(0);
  });
});
