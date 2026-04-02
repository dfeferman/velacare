import { getAktiveProdukte } from '@/lib/dal/produkte'
import { BeantragenContent } from './beantragen-content'

export default async function BeantragenPage() {
  const produkte = await getAktiveProdukte()
  return <BeantragenContent produkte={produkte} />
}
