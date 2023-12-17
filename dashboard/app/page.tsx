import { Logo } from '@/components/logo'
import { ButtonLink } from '@/components/ui/button-link'
import { routes } from '@/config/routes'
import { Button, Card, CardBody, CardHeader } from '@nextui-org/react'

export default async function Home() {
  return (
    <main className="flex grow justify-center p-5 md:p-10">
      <section className="flex flex-col gap-10">
        <h1 className="text-center text-3xl font-semibold">
          Select blockchain to view
        </h1>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Card className="w-full max-w-2xl p-4">
            <CardHeader className="flex-col gap-2">
              <Logo id="scrollBlockchain" />
              <h2 className="font-medium">Scroll Blockchain</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <p className="text-justify align-baseline text-default-600">
                Scroll seamlessly extends Ethereum’s capabilities through zero
                knowledge tech and EVM compatibility. The L2 network built by
                Ethereum devs for Ethereum devs.
              </p>
              <ButtonLink color="primary" href={routes.scroll.home}>
                Explore
              </ButtonLink>
            </CardBody>
          </Card>

          <Card className="w-full max-w-2xl p-4">
            <CardHeader className="flex-col gap-2">
              <h2 className="font-medium">Other Blockchains (Coming Soon)</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <p className="text-justify align-baseline text-default-600">
                Other blockchains will be added soon. Stay tuned!
              </p>
              <Button disabled className="mt-auto" href={routes.scroll.home}>
                Coming Soon
              </Button>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  )
}
