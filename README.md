# Klaus Dellano

Tech Lead na **HAVAN**, em Brusque/SC (natural de Aracaju/SE). Hoje construo aplicações de IA em produção: agentes conversacionais, orquestração com LLMs e servidores MCP.

### O que faço hoje
- **Atendimento com IA em escala**: lidero a camada de IA de um assistente de atendimento no WhatsApp. Cuido do pipeline do turno (respostas rápidas sem LLM, execução determinística de ferramentas, fallback com guardrails), da classificação de intenção, do transbordo para humano e de um negociador multiagente que só oferece condições reais vindas das APIs.
- **MCP (Model Context Protocol)**: desenho servidores provider-only, com catálogo de tools, contrato de resposta padronizado, memória em Redis e roteamento entre vários servidores.
- **Qualidade de LLM**: avaliação de conversas com juiz LLM, observabilidade com Datadog LLM Observability e redução de custo e latência por roteamento entre modelos.

### Projetos pessoais recentes

<details>
<summary><strong><a href="https://falaeco.com">FalaEco</a></strong>: plataforma de inglês com IA</summary>

Produto completo para brasileiros adultos. Não é flashcard com chat: fecha o ciclo entre revisão espaçada, pronúncia, conversa real e orientação no dia a dia.

- **Revisão inteligente (FSRS)** com cards de conceito, vocabulário e correção, áudio de referência e atalho pra treinar pronúncia sem bagunçar o agendamento.
- **Ecoar**: shadowing avaliado por modelo de áudio, com feedback que volta pro SRS, modo só escuta e retomada de sessão.
- **Conversar com o Jake**: simulador com feedback estruturado, por turnos ou ao vivo com voz em tempo real na web, e o mesmo tutor no Telegram, gerando cards e um kit "pronto pra falar".
- **Coach do dia**: foco diário com recado em linguagem natural e memória de longo prazo do aluno (padrões, cards difíceis, frases que travam).
- **Trazer material e aulas**: texto, áudio ou aula capturada viram frases, flashcards e anotações na Biblioteca, organizadas em trilhas com cadência.
- Jogos de produção, diagnóstico de voz "antes e depois", mentoria entre mentor e aluno, assinatura e créditos via Mercado Pago, PWA com push.

**Stack:** Python/FastAPI · Supabase (Postgres, RLS, Storage) · OpenAI (texto, áudio, voz em tempo real, TTS) · FSRS · Telegram Bot · PWA · Railway.
</details>

<details>
<summary><strong><a href="https://ednfit.com.br">EDN, Engenharia dos Naturais</a></strong>: treino system-driven</summary>

Plataforma para atletas naturais que fecha o ciclo entre o que você treina, como se recupera e o que o sistema recomenda em seguida, seguindo um protocolo próprio de volume, intensidade e periodização.

- **Treino guiado** com logger completo, RIR, timer de descanso, troca de exercício e checagem de protocolo.
- **Motor de progressão e periodização**: mesociclos por fase, deload, avaliação de ciclo e auditoria de volume por músculo e nível.
- **Rotina inteligente multiagente**: especialistas por domínio, geração paralela por dia e avaliação, com validações determinísticas e progresso em streaming.
- **Nutrição com IA**: plano alimentar com alimentos brasileiros, substituições e ajuste fino, orquestrado com LangGraph.
- **Body intelligence**: medidas, check-ins, bioimpedância lida de imagem ou PDF e diário de treino com leitura de fadiga.

**Stack:** Python/FastAPI · SQLAlchemy async · Supabase · Gemini · LangGraph · Next.js/TypeScript/Tailwind · PWA · Railway + Vercel.
</details>

- **[arXiv AI Insights](https://github.com/kdds22/arxiv-ai-insights)**: curadoria diária de artigos do arXiv sobre LLMs, agentes e sistemas multiagente.

### Stack
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-000000?style=for-the-badge&logo=anthropic&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langgraph&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Datadog](https://img.shields.io/badge/Datadog-632CA6?style=for-the-badge&logo=datadog&logoColor=white)
![Azure DevOps](https://img.shields.io/badge/Azure%20DevOps-0078D7?style=for-the-badge&logo=azuredevops&logoColor=white)

<details>
<summary>Antes da IA</summary>

Fui desenvolvedor Android (Kotlin) e trabalhei com C#/.NET, RFID com Zebra, visão computacional (OpenCV, TensorFlow) e game jams com Godot.
</details>

### Contato
[![LinkedIn](https://img.shields.io/badge/LinkedIn-klaus--dellano-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/klaus-dellano/)
[![X](https://img.shields.io/badge/X-@klausdell-000?style=flat-square&logo=x)](https://x.com/klausdell)
[![Gmail](https://img.shields.io/badge/-klaus.dd.sa@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white)](mailto:klaus.dd.sa@gmail.com)
