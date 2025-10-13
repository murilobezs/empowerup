import React from "react";
import { PageLayout } from "../components/layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useForm } from "../hooks/useForm";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function ContactPage() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm({
    initialValues: {
      nome: "",
      email: "",
      assunto: "",
      mensagem: "",
    },
    validationRules: {
      nome: 'required',
      email: 'email',
      assunto: 'required',
      mensagem: 'required'
    },
    onSubmit: async (data) => {
      console.log("Formulário enviado:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Mensagem enviada com sucesso!");
    }
  });

  const heroRef = useScrollReveal({ threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
  const contentRef = useScrollReveal({ delay: 100, stagger: 140 });

  return (
    <PageLayout 
      title="Contato" 
      description="Entre em contato conosco"
      showBreadcrumb={true}
    >
      <div className="space-y-20">
        <section ref={heroRef} data-reveal className="text-center space-y-8">
          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary text-lg px-6 py-2">
              Fale Conosco
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Entre em <span className="text-primary">contato</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Estamos aqui para ajudar você a começar sua jornada empreendedora.
            </p>
          </div>
        </section>

        <section ref={contentRef} data-reveal className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card data-reveal-child>
            <CardHeader>
              <CardTitle>Envie sua mensagem</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo e entraremos em contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="Seu nome completo"
                    value={values.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.nome && touched.nome && (
                    <p className="text-sm text-destructive">{errors.nome}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.email && touched.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto</Label>
                  <Input
                    id="assunto"
                    name="assunto"
                    placeholder="Assunto da mensagem"
                    value={values.assunto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    placeholder="Escreva sua mensagem..."
                    rows={6}
                    value={values.mensagem}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div data-reveal-child className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>contato@empowerup.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+55 (11) 9999-9999</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>São Paulo, SP</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Seg a Sex, 9h às 18h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}