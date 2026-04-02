import { getAktiveProdukte } from '@/lib/dal/produkte'
import { ProduktePublicContent } from './produkte-public-content'

export default async function ProduktePublicPage() {
  const produkte = await getAktiveProdukte()
  return <ProduktePublicContent produkte={produkte} />
}
