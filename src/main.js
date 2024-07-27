"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const zod_1 = require("zod");
const mapper = (issues) => {
    return issues === null || issues === void 0 ? void 0 : issues.map((issue) => {
        console.log(`mapping ${issue.code}`);
        switch (issue === null || issue === void 0 ? void 0 : issue.code) {
            case 'custom':
                return {
                    message: 'custom message',
                    isCustom: true
                };
            default:
                return issue;
        }
    });
};
const BazSchema = zod_1.z.string();
const BarSchema = zod_1.z.object({
    baz: BazSchema
});
const FooSchema = zod_1.z.object({
    bar: BarSchema
});
const RefinedFooSchema = FooSchema.refine((data) => {
    const parseResult = BarSchema.safeParse(data);
    console.log(`RefinedFooSchema.success: ${parseResult.success}`);
    return parseResult.success;
}, {
    message: 'RefinedFooSchema',
});
const FirstSuperRefinedFooSchema = FooSchema.superRefine((data, ctx) => {
    if (!BarSchema.safeParse(data).success) {
        ctx.addIssue({
            code: 'custom',
            message: 'first super refined custom message',
        });
    }
});
const SecondSuperRefinedFooSchema = FooSchema.superRefine((data, ctx) => {
    if (!(BarSchema.safeParse(data).success && BazSchema.safeParse(data.bar.baz).success)) {
        console.log(`Second super refined adding issue`);
        ctx.addIssue({
            code: 'custom',
            message: 'second super refined custom message',
        });
    }
});
const OtherFooSchema = zod_1.z.object({
    bar: zod_1.z.object({
        baz: zod_1.z.any()
    })
});
const ThirdSuperRefinedFooSchema = OtherFooSchema.superRefine((data, ctx) => {
    if (!(BarSchema.safeParse(data).success && BazSchema.safeParse(data.bar.baz).success)) {
        console.log(`Second super refined adding issue`);
        ctx.addIssue({
            code: 'custom',
            message: 'second super refined custom message',
        });
    }
});
const wrongTypeBaz = {
    foo: {
        baz: 1
    }
};
const noBaz = {
    foo: {}
};
const main = () => {
    var _a, _b, _c, _d, _e;
    console.log('stupid demo');
    let parseResult = FooSchema.safeParse(wrongTypeBaz);
    console.log({ wrongTypeBaz });
    console.log(JSON.stringify({ error: mapper((_a = parseResult.error) === null || _a === void 0 ? void 0 : _a.issues) }));
    parseResult = RefinedFooSchema.safeParse(wrongTypeBaz);
    console.log('RefinedFoo');
    console.log(JSON.stringify({ error: mapper((_b = parseResult.error) === null || _b === void 0 ? void 0 : _b.issues) }));
    parseResult = FirstSuperRefinedFooSchema.safeParse(noBaz);
    console.log('FirstSuperRefinedFoo');
    console.log(JSON.stringify({ error: mapper((_c = parseResult.error) === null || _c === void 0 ? void 0 : _c.issues) }));
    parseResult = SecondSuperRefinedFooSchema.safeParse(noBaz);
    console.log('SecondSuperRefinedFoo');
    console.log(JSON.stringify({ error: mapper((_d = parseResult.error) === null || _d === void 0 ? void 0 : _d.issues) }));
    let otherParseResult = ThirdSuperRefinedFooSchema.safeParse(noBaz);
    console.log('ThirdSuperRefinedFoo');
    console.log(JSON.stringify({ error: mapper((_e = otherParseResult.error) === null || _e === void 0 ? void 0 : _e.issues) }));
};
exports.main = main;
(0, exports.main)();
