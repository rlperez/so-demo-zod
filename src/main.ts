import { z, ZodIssue } from 'zod';

type ValidationResult = {
  message: string;
  isCustom: boolean | undefined;
}

const mapper = (issues: ZodIssue[] | undefined)=> {
  return issues?.map((issue) => {
    console.log(`mapping ${issue.code}`);
    switch(issue?.code) {
      case 'custom': 
        return {
          message: 'custom message',
          isCustom: true
        }
      default:
        return issue;
    }
  });
}

const BazSchema = z.string();

const BarSchema = z.object({
  baz: BazSchema
});

const FooSchema = z.object({
  bar: BarSchema
});

const RefinedFooSchema = FooSchema.refine(
  (data) => {

  const parseResult = BarSchema.safeParse(data);
  console.log(`RefinedFooSchema.success: ${parseResult.success}`)
  return parseResult.success;
}, {
    message: 'RefinedFooSchema',
  }
);

const FirstSuperRefinedFooSchema = FooSchema.superRefine((data, ctx) => {
  if(!BarSchema.safeParse(data).success) {
    ctx.addIssue({
      code: 'custom',
      message: 'first super refined custom message',
    });
  }
});

const SecondSuperRefinedFooSchema = FooSchema.superRefine((data, ctx) => {
  if(!(BarSchema.safeParse(data).success && BazSchema.safeParse(data.bar.baz).success)) {
    console.log(`Second super refined adding issue`);
    ctx.addIssue({
      code: 'custom',
      message: 'second super refined custom message',
    });
  }
});

const OtherFooSchema = z.object({
  bar: z.object({
    baz: z.any()
  })
});

const ThirdSuperRefinedFooSchema = OtherFooSchema.superRefine((data, ctx) => {
  if(!(BarSchema.safeParse(data).success && BazSchema.safeParse(data.bar.baz).success)) {
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
}

const noBaz = {
  foo: {}
}

export const main = () => {
  console.log('stupid demo');

  let parseResult = FooSchema.safeParse(wrongTypeBaz);
  console.log({ wrongTypeBaz });
  
  console.log(JSON.stringify({ error: mapper(parseResult.error?.issues) }));

  parseResult = RefinedFooSchema.safeParse(wrongTypeBaz);
  console.log('RefinedFoo')
  console.log(JSON.stringify({ error: mapper(parseResult.error?.issues) }));

  parseResult = FirstSuperRefinedFooSchema.safeParse(noBaz);
  console.log('FirstSuperRefinedFoo');
  console.log(JSON.stringify({ error: mapper(parseResult.error?.issues) }));

  parseResult = SecondSuperRefinedFooSchema.safeParse(noBaz);
  console.log('SecondSuperRefinedFoo');
  console.log(JSON.stringify({ error: mapper(parseResult.error?.issues) }));

  let otherParseResult = ThirdSuperRefinedFooSchema.safeParse(noBaz);
  console.log('ThirdSuperRefinedFoo');
  console.log(JSON.stringify({ error: mapper(otherParseResult.error?.issues) }))
}

main();
