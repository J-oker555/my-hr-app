from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from applications.models import Application

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metrics(request):
    total = Application.objects.count()
    avg = Application.objects.average('score') or 0
    statuses = ['received','reviewing','shortlisted','rejected','hired']
    by = {s: Application.objects(status=s).count() for s in statuses}
    return Response({'applications_total': total, 'score_avg': round(avg,2), 'by_status': by})
