import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Gran Maestro Dashboard
              <Badge variant="secondary">v0.26.0</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              React + shadcn/ui 인프라 설정 완료. 컴포넌트 마이그레이션 대기 중.
            </p>
            <Button>Test Button</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
