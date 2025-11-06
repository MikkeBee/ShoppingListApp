I made a shopping list app designed around my own wants and needs. I used Spec-kit, as it was necessary to learn it for work. I wasn't originally going to put this up, but it turned out rather nice, so why not? After a few fails, I finally got this out. One of the key factors of success was initialising the app myself, then building on top of it. I kind of winged it from the start. I had no designs, data structures, nothing. Just an idea of what colours to use and how it should function. While I thought my instructions were basic and non-complex, the AI still built a pretty robust and complex app. So now of course I know where to add and substract from the instructions to make it more or less streamlined. The app was built in stages according to the task list, which may have been the cause for some errors I encountered along the way. I would say about 3-4 days went into the build (jumping back and forth between other tasks), and then another 3-4 days trouble-shooting errors. Errors ranged from visibility issues (which was probably the biggest issue) to unused variables. Everything was done by AI (unfortunately?), with me just writing prompts and instructions. While building the UI myself is easy, spec-kit was very handy in quickly setting up all of the "extra" stuff, like lint, prettier, etc, and building action functions. I haven't set up tests or deployed anywhere (I wasn't sure what to expect of the app to begin with), but maybe I'll do that in the next project.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
