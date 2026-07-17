pnpm run dev:common &
pnpm run dev:attack &
pnpm run dev:payment &
cd ../dashboard && pnpm dev &
cd ../reverse-proxy && go run . &
cd ../attack-node-router && go run . &