'use client'

import { useState } from 'react'
import { User, Building2, Clock, Bell, Link2, Users, CreditCard, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const MENU_ITEMS = [
  { id: 'account', label: 'Minha Conta', icon: User },
  { id: 'shop', label: 'Oficina', icon: Building2 },
  { id: 'hours', label: 'Horários', icon: Clock },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'integrations', label: 'Integrações', icon: Link2 },
  { id: 'team', label: 'Equipe', icon: Users },
  { id: 'billing', label: 'Plano', icon: CreditCard },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('shop')

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 animate-fade-in">
      <h1 className="text-heading text-text-primary mb-6">Configurações</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-56 shrink-0">
          <nav className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'shop' && <ShopSettings />}
          {activeSection === 'account' && <AccountSettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'hours' && <HoursSettings />}
          {activeSection === 'integrations' && <IntegrationsSettings />}
          {activeSection === 'team' && <TeamSettings />}
          {activeSection === 'billing' && <BillingSettings />}
        </div>
      </div>
    </div>
  )
}

function ShopSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Oficina</CardTitle>
        <CardDescription>
          Informações básicas sobre sua bicicletaria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Nome da oficina
          </label>
          <Input defaultValue="Bike Shop do Carlos" />
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Endereço
          </label>
          <Input defaultValue="Rua das Bikes, 123 - São Paulo" />
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Telefone / WhatsApp
          </label>
          <Input defaultValue="(11) 99999-1234" />
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-secondary flex items-center justify-center">
              <Building2 className="h-8 w-8 text-text-tertiary" />
            </div>
            <Button variant="secondary">Fazer upload</Button>
          </div>
        </div>

        <hr className="my-6" />

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Etapas da Ordem de Serviço
          </label>
          <p className="text-sm text-text-secondary mb-3">
            Arraste para reordenar as etapas do fluxo
          </p>
          <div className="space-y-2">
            {['Recebida', 'Em Diagnóstico', 'Aguardando Aprovação', 'Em Execução', 'Pronta para Entrega', 'Entregue'].map(
              (stage) => (
                <div
                  key={stage}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary cursor-move"
                >
                  <span className="text-text-tertiary">☰</span>
                  <span className="text-sm text-text-primary">{stage}</span>
                </div>
              )
            )}
          </div>
          <Button variant="secondary" className="mt-3">
            + Adicionar etapa
          </Button>
        </div>

        <div className="flex justify-end pt-4">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AccountSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Minha Conta</CardTitle>
        <CardDescription>Suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Nome
          </label>
          <Input defaultValue="Carlos Silva" />
        </div>
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Email
          </label>
          <Input defaultValue="carlos@bikeshop.com" type="email" />
        </div>
        <div className="flex justify-end pt-4">
          <Button>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Configure como você quer ser notificado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { label: 'Nova mensagem de cliente', enabled: true },
            { label: 'OS atrasada', enabled: true },
            { label: 'Estoque crítico', enabled: true },
            { label: 'Novo agendamento', enabled: false },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-text-primary">{item.label}</span>
              <button
                className={cn(
                  'w-11 h-6 rounded-full transition-colors',
                  item.enabled ? 'bg-brand-500' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'block w-5 h-5 rounded-full bg-white shadow transition-transform',
                    item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HoursSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Funcionamento</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary">
          Configure os horários de funcionamento da sua oficina.
        </p>
        <p className="text-sm text-text-tertiary mt-4 italic">
          Em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  )
}

function IntegrationsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações</CardTitle>
        <CardDescription>Conecte com outras ferramentas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
                W
              </div>
              <div>
                <p className="font-medium text-text-primary">WhatsApp Business</p>
                <p className="text-sm text-text-secondary">
                  Receba e envie mensagens pelo sistema
                </p>
              </div>
            </div>
            <Button variant="secondary">Conectar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipe</CardTitle>
        <CardDescription>Gerencie quem tem acesso ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-tertiary italic">
          Em desenvolvimento... (disponível em planos superiores)
        </p>
      </CardContent>
    </Card>
  )
}

function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Plano</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg border-2 border-brand-500 bg-brand-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand-600">Plano Starter</p>
              <p className="text-sm text-text-secondary">
                Ideal para começar • 1 usuário
              </p>
            </div>
            <span className="text-2xl font-bold text-brand-600">Grátis</span>
          </div>
        </div>
        <Button variant="secondary" className="mt-4">
          Ver outros planos
        </Button>
      </CardContent>
    </Card>
  )
}
